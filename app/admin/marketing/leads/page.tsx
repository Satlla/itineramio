import { redirect } from 'next/navigation'

export default function MarketingLeadsRedirect() {
  redirect('/admin/leads?tab=marketing')
}
