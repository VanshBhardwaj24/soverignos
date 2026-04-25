import { useSovereignStore } from '../store/sovereign';
import { toast } from 'sonner';

export function useQuestSystem() {
  const store = useSovereignStore();

  const handleAddQuest = async (quest: any) => {
    try {
      if (!quest.title || quest.title.trim() === '') {
        toast.error("Validation Failed", { description: "Quest title cannot be empty." });
        return false;
      }
      await store.addQuest(quest);
      toast.success("Quest Added", { description: "New mission protocol initiated." });
      return true;
    } catch (error) {
      console.error("Quest add error:", error);
      toast.error("System Error", { description: "Failed to initialize quest." });
      return false;
    }
  };

  const handleCompleteQuest = async (id: string) => {
    try {
      await store.completeQuest(id);
      toast.success("Quest Completed", { description: "Mission accomplished. Rewards distributed." });
      return true;
    } catch (error) {
      console.error("Quest complete error:", error);
      toast.error("System Error", { description: "Failed to complete quest." });
      return false;
    }
  };

  const handleDeleteQuest = async (id: string) => {
    try {
      await store.deleteQuest(id);
      toast.success("Quest Deleted", { description: "Mission data purged." });
      return true;
    } catch (error) {
      console.error("Quest delete error:", error);
      toast.error("System Error", { description: "Failed to delete quest." });
      return false;
    }
  };

  return {
    quests: store.dailyQuests,
    addQuest: handleAddQuest,
    completeQuest: handleCompleteQuest,
    failQuest: store.failQuest,
    protectQuest: store.protectQuest,
    postponeQuest: store.postponeQuest,
    archiveQuest: store.archiveQuest,
    restoreQuest: store.restoreQuest,
    deleteQuest: handleDeleteQuest,
    bulkCompleteQuests: store.bulkCompleteQuests,
    bulkDeleteQuests: store.bulkDeleteQuests,
    completeSubtask: store.completeSubtask,
    updateQuest: store.updateQuest,
    updateQuestNotes: store.updateQuestNotes,
  };
}
