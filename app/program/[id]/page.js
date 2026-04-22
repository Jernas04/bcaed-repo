"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function YearsPage({ params }) {
  const p = use(params)
  const [years, setYears] = useState([])
  const router = useRouter()

  useEffect(() => {
    fetchYears()
  }, [])

  async function fetchYears() {
    const { data, error } = await supabase
      .from("years")
      .select("*")
      .eq("program_id", p.id)

    if (error) {
      console.log(error)
      return
    }

    setYears(data)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Years</h1>

      {years.map((y) => (
        <div
          key={y.id}
          onClick={() =>
            router.push(`/program/${p.id}/year/${y.id}`)
          }
          style={{
            padding: 15,
            margin: 10,
            border: "1px solid gray",
            cursor: "pointer"
          }}
        >
          {y.year_level}
        </div>
      ))}
    </div>
  )
}
