import { supabase } from "../lib/subabase.js";

// Fetch wallet data
export const wallet = async (req, res) => {
  try {
    const {
      user
    } = req;
    const {
      data: walletData,
      error: walletError
    } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single().select("*");
    if (walletError) throw walletError;
    const {
      data: transactionsData,
      error: transactionsError
    } = await supabase.from("transactions").select("*").eq("wallet_id", walletData.id).order("timestamp", {
      ascending: false
    });
    if (transactionsError) throw transactionsError;
    res.status(200).json({
      balance: walletData.balance,
      transactions: transactionsData
    });
  } catch (error) {
    console.error("Error fetching wallet data:", error.message);
    res.status(500).json({
      error: error.message
    });
  }
};

// Add tokens
export const addTokens = async (req, res) => {
  try {
    const {
      user
    } = req;
    const {
      amount,
      voucherCode
    } = req.body;
    console.log(amount);
    console.log(user);
    const {
      data: walletData,
      error: walletError
    } = await supabase.from("wallets").select("id, balance").eq("user_id", user.id).single();
    if (walletError) throw walletError;
    const {
      error: updateError
    } = await supabase.from("wallets").update({
      balance: walletData.balance + amount
    }).eq("id", walletData.id);
    if (updateError) throw updateError;
    const {
      error: insertError
    } = await supabase.from("transactions").insert([{
      wallet_id: walletData.id,
      type: "voucher",
      amount: amount,
      description: "Voucher redemption",
      voucher_code: voucherCode
    }]);
    if (insertError) throw insertError;
    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error("Error adding tokens:", error.message);
    res.status(500).json({
      error: error.message
    });
  }
};

// Deduct token async
export const deductToken = async (req, res) => {
  try {
    const {
      user
    } = req;
    const {
      amount,
      description
    } = req.body;
    const {
      data: walletData,
      error: walletError
    } = await supabase.from("wallets").select("id, balance").eq("user_id", user.id).single();
    if (walletError) throw walletError;
    if (walletData.balance < amount) {
      return res.status(400).json({
        error: "Insufficient balance"
      });
    }
    const {
      error: updateError
    } = await supabase.from("wallets").update({
      balance: walletData.balance - amount
    }).eq("id", walletData.id);
    if (updateError) throw updateError;
    const {
      error: insertError
    } = await supabase.from("transactions").insert([{
      wallet_id: walletData.id,
      type: "deduction",
      amount: -amount,
      description: description
    }]);
    if (insertError) throw insertError;
    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error("Error deducting tokens:", error.message);
    res.status(500).json({
      error: error.message
    });
  }
};