"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "./Badge";
import type { Lead, PipelineStage, Profile } from "@/lib/supabase/types";

type KanbanLead = Lead & {
  assigned_profile: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
};

interface KanbanBoardProps {
  stages: PipelineStage[];
  leads: KanbanLead[];
}

function LeadCard({
  lead,
  dragging,
}: {
  lead: KanbanLead;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-[#1a1a1a] border border-white/[0.06] rounded-lg p-3.5 cursor-grab active:cursor-grabbing
        hover:border-white/[0.12] transition-colors select-none
        ${dragging ? "shadow-2xl rotate-1 border-[#E63B2E]/30" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-white/80 text-sm font-medium leading-tight">
          {lead.name}
        </p>
        <div className="shrink-0">
          <div
            className="w-6 h-6 rounded-full bg-[#E63B2E]/10 flex items-center justify-center text-[#E63B2E] text-[9px] font-bold"
            title={lead.assigned_profile?.full_name ?? "Non assegnato"}
          >
            {lead.assigned_profile?.full_name?.[0]?.toUpperCase() ?? "?"}
          </div>
        </div>
      </div>

      {lead.company && (
        <p className="text-white/30 text-xs mb-2">{lead.company}</p>
      )}

      <div className="flex items-center justify-between">
        <StatusBadge status={lead.status} />
        {lead.score > 0 && (
          <span className="text-white/25 text-[10px] tabular-nums">
            {lead.score}pt
          </span>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ stages, leads }: KanbanBoardProps) {
  const router = useRouter();
  const [localLeads, setLocalLeads] = useState(leads);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeCard = activeId
    ? localLeads.find((l) => l.id === activeId) ?? null
    : null;

  const leadsByStage = useCallback(
    (stageId: string) => localLeads.filter((l) => l.stage_id === stageId),
    [localLeads]
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = String(active.id);
    const overId = String(over.id);

    // overId can be a stageId (dropped on empty column) or a leadId
    const targetStage = stages.find(
      (s) => s.id === overId || leadsByStage(s.id).some((l) => l.id === overId)
    );

    if (!targetStage) return;

    const draggedLead = localLeads.find((l) => l.id === leadId);
    if (!draggedLead || draggedLead.stage_id === targetStage.id) return;

    // Optimistic update
    setLocalLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, stage_id: targetStage.id } : l
      )
    );

    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("leads") as any)
      .update({ stage_id: targetStage.id, updated_at: new Date().toISOString() })
      .eq("id", leadId);

    router.refresh();
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = leadsByStage(stage.id);
          return (
            <div
              key={stage.id}
              className="shrink-0 w-[280px] flex flex-col"
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: stage.color }}
                  />
                  <span className="text-white/70 text-sm font-semibold">
                    {stage.name}
                  </span>
                  <span className="text-white/25 text-xs bg-white/[0.06] px-1.5 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>
              </div>

              {/* Drop zone */}
              <div
                id={stage.id}
                className="flex-1 min-h-[200px] bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 space-y-2.5"
              >
                <SortableContext
                  id={stage.id}
                  items={stageLeads.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {stageLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                </SortableContext>

                {stageLeads.length === 0 && (
                  <div className="h-24 flex items-center justify-center border border-dashed border-white/[0.06] rounded-lg">
                    <p className="text-white/15 text-xs">Trascina qui</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeCard && <LeadCard lead={activeCard} dragging />}
      </DragOverlay>
    </DndContext>
  );
}
