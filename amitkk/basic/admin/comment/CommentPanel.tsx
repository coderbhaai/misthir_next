import Link from "next/link";
import { useAuth } from "contexts/AuthContext";
import CommentForm from "./CommentForm";
import { SingleCommentProps } from "@amitkk/basic/types/shared";
import DateTimeFormat from "@amitkk/components/admin/date-format";

export default function CommentPanel({ module, module_id, module_name, comments }: { module: string; module_id?: string; module_name?: string; comments: SingleCommentProps[] }) {
  if (!module_id) return null;

  const { isLoggedIn } = useAuth();

  return (
    <div className="w-full py-10">
      {!isLoggedIn ? (
        <div className="py-16 text-center">
          <h3 className="mb-4 text-lg font-semibold">Please login to share your views on {module_name}</h3>
          <Link href="/auth/login" className="inline-block rounded-full bg-primary px-6 py-3 text-white font-semibold">
            Go to Login
          </Link>
        </div>
      ) : (
        <div className="py-8">
          <h2 className="mb-2 text-center text-xl font-semibold">Share Views on {module_name}</h2>
          <p className="mb-6 text-center text-sm text-gray-500">Please keep comments respectful and non-promotional.</p>
          <CommentForm module={module} module_id={module_id} />
        </div>
      )}

      <div className="mt-10 space-y-4">
        {comments?.map((i) => (
          <div key={String(i._id)} className="flex rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white font-bold">
              {(i?.name || "A").charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-semibold">{i?.name || "Anonymous"}</p>
                {i?.createdAt && <span className="text-xs text-gray-500"><DateTimeFormat value={i.createdAt} /></span>}
              </div>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{i?.content || ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}