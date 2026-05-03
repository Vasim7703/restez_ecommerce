import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Note: This expects a 'todos' table to exist in your Supabase project.
  const { data: todos, error } = await supabase.from('todos').select()

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Error fetching todos</h1>
        <p className="text-gray-600">{error.message}</p>
        <p className="mt-4 text-sm text-gray-400">
          Make sure your <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are correct in <code>.env.local</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Test Page</h1>
      <ul className="space-y-2">
        {todos?.length === 0 && <li className="text-gray-500">No todos found (or table is empty).</li>}
        {todos?.map((todo: any) => (
          <li key={todo.id} className="p-4 border rounded shadow-sm hover:bg-gray-50">
            {todo.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
