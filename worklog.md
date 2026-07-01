---
Task ID: 1
Agent: Main
Task: Implement vendor approval system - vendors must be approved by admin before accessing vendor panel

Work Log:
- Added `rejectionReason` field to Vendor model in Prisma schema
- Created `/api/auth/vendor-register` API route for vendor registration (creates User + Vendor with PENDING status)
- Updated `/api/auth` login route to return `vendorStatus` and allow PENDING/REJECTED vendors to log in
- Updated `/api/vendors/[id]` PUT route to handle rejection reason, create notifications on status changes, mark user as verified on approval
- Updated Zustand auth store to include `vendorStatus` field
- Updated `Vendor` type to include `rejectionReason`
- Updated login calls to pass `vendorStatus` to auth store
- Replaced CustomerApp LoginPage with 3-tab version (Login / Customer / Vendor) with full vendor registration form
- Added VendorPendingPage and VendorSuspendedPage components to VendorApp
- Added authentication and status gates to VendorApp main component
- Enhanced AdminApp AdminVendors with: rejection reason dialog, better pending vendor highlighting, detailed business/tax/bank info, performance stats, "Pending Review" badge
- Fixed hydration mismatch on dark mode toggle (suppressHydrationWarning)
- Fixed JSX closing tag errors in AdminApp
- Re-seeded database with updated schema
- Full API verification: register → pending → approve/reject → login flows all working

Stage Summary:
- Vendor registration now requires admin approval (status PENDING)
- Pending/rejected vendors can log in but see status page (not full vendor panel)
- Suspended vendors are completely blocked from logging in
- Admin can approve, reject (with reason), suspend, and re-activate vendors
- Notifications are created for vendors on status changes
- Approved vendors are automatically marked as verified
- Login page now has 3 tabs: Login, Customer Register, Vendor Register
- Vendor registration form includes: account details, business details, tax & bank details
