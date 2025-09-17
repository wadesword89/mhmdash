export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <span>Version:</span>
            <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
              v1.0.0
            </code>
          </div>
        </div>

        <div className="flex flex-col space-y-2 sm:space-y-0 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <a
              href="mailto:pmehta@ebmud.com"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
