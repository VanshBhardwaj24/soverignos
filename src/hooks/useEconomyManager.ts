import { useSovereignStore } from '../store/sovereign';
import { toast } from 'sonner';
import { SHOP_ITEMS } from '../lib/constants';

export function useEconomyManager() {
  const store = useSovereignStore();

  const handleBuyItem = async (itemId: string) => {
    try {
      // Find the item to check cost. Look in preset SHOP_ITEMS and customRewards.
      const item = SHOP_ITEMS.find(i => i.id === itemId) || store.customRewards.find(i => i.id === itemId);

      if (!item) {
        toast.error("Invalid Item", { description: "The requested item could not be found." });
        return false;
      }

      if (store.gold < item.cost) {
        toast.error("Transaction Failed", { description: "Insufficient gold to purchase this item." });
        return false;
      }

      await store.buyItem(itemId, item.cost);
      toast.success("Purchase Complete", { description: `Acquired ${item.name}.` });
      return true;
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("System Error", { description: "Failed to process purchase." });
      return false;
    }
  };

  const handleRequestLoan = async (itemId: string, durationMonths: number, repaymentType: 'all_earnings' | 'monthly_target') => {
    try {
      const result = await store.requestLoan(itemId, durationMonths, repaymentType);
      if (result.success) {
        toast.success("Loan Approved", { description: "Funds have been diverted successfully." });
        return { success: true };
      } else {
        toast.error("Loan Denied", { description: result.error || "Could not authorize loan at this time." });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Loan error:", error);
      toast.error("Loan System Error", { description: "An unexpected error occurred." });
      return { success: false, error: "SYSTEM_ERROR" };
    }
  };

  const handleAddTransaction = async (tx: any) => {
    try {
      await store.addTransaction(tx);
      return true;
    } catch (error) {
      toast.error("Transaction Error", { description: "Failed to log transaction." });
      return false;
    }
  };

  return {
    gold: store.gold,
    transactions: store.transactions,
    financialGoals: store.financialGoals,
    portfolios: store.portfolios,
    recurringTransactions: store.recurringTransactions,
    activeLoans: store.activeLoans,
    inventory: store.inventory,
    wishlist: store.wishlist,
    customRewards: store.customRewards,
    buyItem: handleBuyItem,
    deployItem: store.deployItem,
    addTransaction: handleAddTransaction,
    updateTransaction: store.updateTransaction,
    deleteTransaction: store.deleteTransaction,
    addFinancialGoal: store.addFinancialGoal,
    allocateToGoal: store.allocateToGoal,
    updateGoalStatus: store.updateGoalStatus,
    addPortfolio: store.addPortfolio,
    updatePortfolioBalance: store.updatePortfolioBalance,
    requestLoan: handleRequestLoan,
    checkLoanStatus: store.checkLoanStatus,
  };
}
