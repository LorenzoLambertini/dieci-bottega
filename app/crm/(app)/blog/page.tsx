import Link from "next/link";
import { createSocialClient } from "@/lib/social-ai/db";
import { getCrmUser } from "@/lib/social-ai/auth";
import { POSTS } from "@/lib/blog";
import { BlogCommentRow, type ModComment } from "@/components/crm/BlogModeration";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "pending", label: "In attesa" },
  { key: "approved", label: "Pubblicati" },
  { key: "spam", label: "Spam" },
  { key: "all", label: "Tutti" },
];

export default async function CrmBlogPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f: raw } = await searchParams;
  const f = FILTERS.some((x) => x.key === raw) ? raw! : "pending";
  const db = await createSocialClient();
  const user = await getCrmUser();
  let q = db.from("blog_comments").select("id, post_slug, author_name, author_email, body, status, is_team, created_at").order("created_at", { ascending: false }).limit(200);
  if (f !== "all") q = q.eq("status", f);
  const [{ data, error }, { data: counts }] = await Promise.all([q, db.from("blog_comments").select("post_slug, status")]);
  const title = new Map(POSTS.map((p) => [p.slug, p.title]));
  const rows = ((data ?? []) as Omit<ModComment, "post_title">[]).map((c) => ({ ...c, post_title: title.get(c.post_slug) ?? c.post_slug }));
  const all = (counts ?? []) as { post_slug: string; status: string }[];
  const pendingCount = all.filter((c) => c.status === "pending").length;
  const perPost = new Map<string, number>();
  for (const c of all) if (c.status === "approved") perPost.set(c.post_slug, (perPost.get(c.post_slug) ?? 0) + 1);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-white text-2xl font-bold">Blog</h1>
          <p className="text-white/40 text-sm mt-0.5">{POSTS.length} articoli pubblicati · {pendingCount} commenti da approvare</p>
        </div>
        <Link href="/blog" target="_blank" className="text-xs bg-white/[0.06] hover:bg-white/[0.12] text-white/80 rounded-lg px-3 py-2">Apri il blog ↗</Link>
      </div>
      {error && <p className="text-[#E63B2E] text-sm mb-4">Tabella commenti non disponibile: {error.message}</p>}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start">
        <div>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {FILTERS.map((x) => (
              <Link key={x.key} href={`/crm/blog?f=${x.key}`} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${f === x.key ? "bg-[#E63B2E] border-[#E63B2E] text-white" : "border-white/[0.08] text-white/40 hover:text-white/70"}`}>
                {x.label}{x.key === "pending" && pendingCount ? ` (${pendingCount})` : ""}
              </Link>
            ))}
          </div>
          <div className="bg-[#141414] border border-white/[0.06] rounded-xl divide-y divide-white/[0.04]">
            {rows.length === 0 && <p className="px-5 py-12 text-center text-white/25 text-sm">{f === "pending" ? "Nessun commento da approvare." : "Nessun commento."}</p>}
            {rows.map((c) => <BlogCommentRow key={c.id} c={c} isAdmin={user?.role === "admin"} />)}
          </div>
        </div>
        <div className="bg-[#141414] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]"><h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider">Articoli</h3></div>
          <div className="divide-y divide-white/[0.04]">
            {POSTS.map((p) => (
              <a key={p.slug} href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="block px-5 py-3 hover:bg-white/[0.02]">
                <p className="text-white/80 text-sm leading-snug">{p.title}</p>
                <p className="text-white/30 text-[11px] mt-0.5">{p.category} · {p.publishedAt} · {perPost.get(p.slug) ?? 0} commenti</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
