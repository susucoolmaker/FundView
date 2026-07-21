import { mount } from '@vue/test-utils'
import { showImagePreview } from 'vant'

import VoucherPreview from './VoucherPreview.vue'

vi.mock('vant', async () => {
  const actual = await vi.importActual<typeof import('vant')>('vant')
  return { ...actual, showImagePreview: vi.fn() }
})

afterEach(() => {
  vi.clearAllMocks()
})

it('shows the dedicated empty copy when a funding record has no voucher', () => {
  const wrapper = mount(VoucherPreview, { props: { images: [] } })

  expect(wrapper.text()).toContain('暂无资金凭证')
  expect(wrapper.find('[data-testid="voucher-thumbnail"]').exists()).toBe(false)
})

it('opens all vouchers at the selected image with Vant ImagePreview', async () => {
  const images = ['/vouchers/one.svg', '/vouchers/two.svg']
  const wrapper = mount(VoucherPreview, { props: { images } })

  const thumbnails = wrapper.findAll('[data-testid="voucher-thumbnail"]')
  expect(thumbnails).toHaveLength(2)
  expect(thumbnails[0]!.get('img').attributes('style')).toContain('object-fit: contain')

  await thumbnails[1]!.trigger('click')

  expect(showImagePreview).toHaveBeenCalledWith({
    images,
    startPosition: 1,
    closeable: true,
  })
})

it('replaces a failed image with an exception placeholder', async () => {
  const wrapper = mount(VoucherPreview, { props: { images: ['/vouchers/broken.svg'] } })

  await wrapper.get('[data-testid="voucher-image"]').trigger('error')

  expect(wrapper.find('[data-testid="voucher-image"]').exists()).toBe(false)
  expect(wrapper.get('[data-testid="voucher-error"]').text()).toContain('凭证加载失败')
})

it('keeps failure state with the image URL after reorder and handles duplicates together', async () => {
  const failedUrl = '/vouchers/failed.svg'
  const healthyUrl = '/vouchers/healthy.svg'
  const wrapper = mount(VoucherPreview, {
    props: { images: [failedUrl, healthyUrl] },
  })

  await wrapper.findAll('[data-testid="voucher-image"]')[0]!.trigger('error')
  await wrapper.setProps({ images: [healthyUrl, failedUrl, failedUrl] })

  const thumbnails = wrapper.findAll('[data-testid="voucher-thumbnail"]')
  expect(thumbnails[0]!.get('[data-testid="voucher-image"]').attributes('src')).toBe(
    healthyUrl,
  )
  expect(thumbnails[1]!.get('[data-testid="voucher-error"]').text()).toContain(
    '凭证加载失败',
  )
  expect(thumbnails[2]!.get('[data-testid="voucher-error"]').text()).toContain(
    '凭证加载失败',
  )
})
