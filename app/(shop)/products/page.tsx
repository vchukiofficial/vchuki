import { redirect } from "next/navigation"

export default function ProductsRedirect({ searchParams }: { searchParams: { category?: string } }) {
  if (searchParams.category) {
    redirect(`/shirts/${searchParams.category}`)
  }
  redirect("/shirts")
}
