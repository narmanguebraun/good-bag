"use server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function addItem(formData) {
  const brand = formData.get("brand");
  const model = formData.get("model");
  const reference = formData.get("reference");

  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    console.error("User is not authenticated within addItem server action");
    return;
  }

  const { data, error } = await supabase.from("items").insert([
    {
      brand,
      model,
      reference,
      user_id: user.id,
    },
  ]);

  if (error) {
    console.error("Error inserting data", error);
    return;
  }

  revalidatePath("/pack-list");

  return { message: "Success" };
}
