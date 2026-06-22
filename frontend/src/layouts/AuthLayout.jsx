export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.5 2 6 4.5 6 8c0 2.5 1.5 4.5 3.5 5.5L12 22l2.5-8.5C16.5 12.5 18 10.5 18 8c0-3.5-2.5-6-6-6zm0 3a2 2 0 110 4 2 2 0 010-4z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold">GFMS</p>
              <p className="text-sm text-primary-100">Goat Farm Management System</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Manage your goat farm with confidence
          </h2>
          <p className="text-primary-100">
            Track goats, medicines, vaccinations, and treatments — all in one centralized platform.
          </p>
          <ul className="space-y-3 text-sm text-primary-100">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-300" />
              Digital goat records & health tracking
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-300" />
              Medicine inventory & expiry alerts
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-300" />
              Role-based access for your team
            </li>
          </ul>
        </div>

        <p className="text-xs text-primary-200">&copy; {new Date().getFullYear()} Goat Farm Management System</p>
      </div>

      <div className="flex w-full flex-col justify-center bg-surface-50 px-6 py-12 lg:w-1/2 lg:px-16">
        {children}
      </div>
    </div>
  );
}
