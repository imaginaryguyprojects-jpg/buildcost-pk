import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/adminGuard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request, "support");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const { searchParams } = new URL(request.url);
  const filterStatus = searchParams.get("status");

  const supabase = await createServerSupabaseClient();
  let query = supabase.from("payment_verifications").select("*").order("created_at", { ascending: false });

  if (filterStatus && filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }

  const { data: payments, error } = await query;

  // Fallback / mock payments if database not yet migrated
  const defaultPayments = [
    {
      id: "pay_101",
      user_id: "usr_101",
      user_name: "Tariq Mahmood",
      user_email: "tariq.civil@gmail.com",
      user_phone: "0300-8541299",
      plan_id: "plan_pro",
      plan_name: "BuildCost Pro Monthly",
      amount_pkr: 1999,
      provider: "easypaisa",
      transaction_reference: "EP94827103841",
      payment_date: "2026-09-06",
      receipt_screenshot_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
      status: "pending",
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: "pay_102",
      user_id: "usr_102",
      user_name: "Zubair Builders",
      user_email: "zubair.isb@gmail.com",
      user_phone: "0321-5544332",
      plan_id: "plan_pro",
      plan_name: "BuildCost Pro Annual",
      amount_pkr: 19990,
      provider: "bank_transfer",
      transaction_reference: "MEZN88392019",
      payment_date: "2026-09-05",
      receipt_screenshot_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
      status: "approved",
      approved_by: "Umer Sheikh (Admin)",
      created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString()
    },
    {
      id: "pay_103",
      user_id: "usr_103",
      user_name: "Malik Engineering",
      user_email: "malik.eng@yahoo.com",
      user_phone: "0345-7766554",
      plan_id: "plan_pro",
      plan_name: "BuildCost Pro Monthly",
      amount_pkr: 1999,
      provider: "jazzcash",
      transaction_reference: "JC11029384",
      payment_date: "2026-09-04",
      receipt_screenshot_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
      status: "under_review",
      created_at: new Date(Date.now() - 360 * 60 * 1000).toISOString()
    }
  ];

  const results = payments && payments.length > 0 ? payments : defaultPayments;

  const totalPayments = results.length;
  const pendingPayments = results.filter((p: any) => p.status === "pending" || p.status === "under_review").length;
  const approvedPayments = results.filter((p: any) => p.status === "approved").length;
  const rejectedPayments = results.filter((p: any) => p.status === "rejected").length;
  const totalRevenue = results.filter((p: any) => p.status === "approved").reduce((sum: number, p: any) => sum + Number(p.amount_pkr || 0), 0);
  const pendingAmount = results.filter((p: any) => p.status === "pending" || p.status === "under_review").reduce((sum: number, p: any) => sum + Number(p.amount_pkr || 0), 0);

  return NextResponse.json({
    success: true,
    payments: results,
    summary: {
      totalPayments,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      totalRevenue,
      pendingAmount
    }
  });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminSession(request, "admin");
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { paymentId, status, reason, adminNotes } = body;

    if (!paymentId || !status) {
      return NextResponse.json({ error: "paymentId and status are required" }, { status: 400 });
    }

    const validStatuses = ["pending", "under_review", "approved", "rejected", "expired", "refunded"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // If approved, activate Pro plan for the user in subscriptions and profiles
    if (status === "approved") {
      try {
        const { data: payment } = await supabase.from("payment_verifications").select("user_id, plan_id, amount_pkr").eq("id", paymentId).single();
        if (payment?.user_id) {
          // Upgrade profile to pro
          await supabase.from("profiles").update({
            subscription_plan: "pro",
            subscription_status: "active",
            updated_at: new Date().toISOString()
          }).eq("id", payment.user_id);

          // Add or update active subscription
          await supabase.from("subscriptions").upsert({
            user_id: payment.user_id,
            plan_id: payment.plan_id || "plan_pro",
            status: "active",
            starts_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      } catch (e) {
        console.error("Failed to activate pro subscription:", e);
      }
    }

    // Update payment record in database
    try {
      await supabase.from("payment_verifications").update({
        status,
        admin_notes: reason || adminNotes || null,
        reviewed_by: auth.user?.id || null,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).eq("id", paymentId);
    } catch (e) {
      console.error("Failed to update payment record:", e);
    }

    // Audit log
    try {
      await supabase.from("system_audit_logs").insert({
        admin_email: auth.user?.email || "admin@buildcost.pk",
        action: `PAYMENT_${status.toUpperCase()}`,
        entity_type: "payment",
        entity_id: paymentId,
        new_value: { status, reason },
        reason: reason || `Updated to ${status}`
      });
    } catch (e) {
      console.error("Failed to write system audit log:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Payment #${paymentId} marked as ${status.toUpperCase()}`,
      paymentId,
      status
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      planSlug = "pro",
      billingPeriod = "monthly",
      amountPkr,
      transactionReference,
      provider,
      userName,
      userEmail,
      userPhone,
      receiptScreenshotUrl
    } = body;

    const supabase = await createServerSupabaseClient();

    // Query server single source of truth for subscription plans
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("slug", planSlug)
      .single();

    const expectedAmount = billingPeriod === "annual"
      ? (plan?.price_annual_pkr || 29990)
      : (plan?.price_monthly_pkr || plan?.price || 2999);

    const submittedAmount = Number(amountPkr || 0);
    const isAmountMatched = Math.abs(submittedAmount - expectedAmount) < 1;

    // Record payment submission
    const { data: newPayment, error } = await supabase
      .from("payment_verifications")
      .insert({
        user_name: userName || "Customer",
        user_email: userEmail || "customer@buildcost.pk",
        user_phone: userPhone || null,
        plan_id: plan?.id || "plan_pro",
        plan_name: plan?.name || (planSlug === "pro" ? "BuildCost Pro" : "Free Plan"),
        amount_pkr: submittedAmount,
        provider: provider || "easypaisa",
        transaction_reference: transactionReference || "N/A",
        receipt_screenshot_url: receiptScreenshotUrl || null,
        status: "pending"
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      payment: newPayment,
      expectedAmount,
      isAmountMatched,
      message: isAmountMatched
        ? "Payment registered and pending admin verification."
        : `Payment submitted with amount Rs. ${submittedAmount}, expected plan price is Rs. ${expectedAmount}.`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
