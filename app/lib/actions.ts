'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// 校验
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.', // 自定义错误提示信息
  }),
  // 强制转为 number, 如input type为 number 时
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }), // 强制转数字之后，空字符串为 0
  // 枚举类型
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
// 丢掉 2 个属性
const CreateInvoice = FormSchema.omit({
  id: true,
  date: true,
});
const UpdateInvoice = CreateInvoice;

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

// 会给这个函数起一个接口
export async function createInvoice(previousState: State, formData: FormData) {
  // 校验，通过则返回值，失败则报错
  const validatedFields = CreateInvoice.safeParse(
    Object.fromEntries(formData.entries()),
  );

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100; // 提高计算精度
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    return { message: 'Database Error: Failed to Create Invoice.' };
  }

  // 本次数据库操作，导致页面数据需要更新
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices'); // 给客户端重定向
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}
