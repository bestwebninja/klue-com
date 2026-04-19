import type { WalkthroughTask } from "../../lib/supabase/types";
import { EditableInlineText } from "../primitives/EditableInlineText";
import { RemoveConfirmButton } from "../primitives/RemoveConfirmButton";

interface TaskColumnEditorProps {
  tasks: WalkthroughTask[];
  onRename: (taskId: string, name: string) => void;
  onRemove: (taskId: string) => void;
}

export function TaskColumnEditor({ tasks, onRename, onRemove }: TaskColumnEditorProps) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between rounded border p-2">
          <EditableInlineText value={task.task_name} onSave={(name) => onRename(task.id, name)} />
          <RemoveConfirmButton label={`task ${task.task_name}`} onConfirm={() => onRemove(task.id)} />
        </div>
      ))}
    </div>
  );
}
