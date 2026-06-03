import { expect, test } from '@playwright/test';

test('creates a document from template and opens public readonly preview', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /课程小组报告/ }).click();

  await expect(page.getByRole('heading', { name: '课程小组报告' })).toBeVisible();
  await page.getByRole('button', { name: '开启公开预览' }).click();

  const previewText = await page.getByText(/公开预览：\/public\//).textContent();
  const token = previewText!.split('/public/')[1];

  await page.goto(`/public/${token}`);
  await expect(page.getByText('公开只读预览')).toBeVisible();
  await expect(page.getByRole('heading', { name: '课程小组报告' })).toBeVisible();
  await expect(page.getByText('登录后可申请加入协作编辑。')).toBeVisible();
});
