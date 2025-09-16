import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = createClient()
  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todos</h1>
      <pre className="bg-gray-100 p-4 rounded-md dark:bg-gray-800">
        {JSON.stringify(todos, null, 2)}
      </pre>
    </div>
  )
}
