'use client';

let iconList = [];

try {
  const req = require.context('../../../', true, /Icon\.tsx$/);

  iconList = req.keys()
    .map((key) => {
      const fileName = key.split('/').pop()?.replace('.tsx', '') || 'Unknown';
      const Component = req(key).default;
      return { fileName, Component };
    })
    .sort((a, b) => a.fileName.localeCompare(b.fileName));
} catch (error) {
  console.warn("Could not dynamically load icons. Check your folder paths.", error);
}

const SIZES = { S: 16, M: 32, L: 64 };
const COLORS = [
  { 'color': '#000000', 'name': 'black' },
  { 'color': '#ef4444', 'name': 'red' },
  { 'color': '#22c55e', 'name': 'green' },
  { 'color': '#3b82f6', 'name': 'blue' }
];

export default function IconShowcasePage() {
  if (iconList.length === 0) {
    return <div className="p-10 text-center">No icons found. Please check your folder structure.</div>;
  }

  return (
    <div className="p-10 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Icon Gallery
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-screen-2xl mx-auto">
        {iconList.map(({ fileName, Component }) => (
          <div
            key={fileName}
            className="bg-(--color-light) rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center transition-shadow hover:shadow-md"
          >
            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700 mb-6">
              {fileName}
            </div>

            <div className="w-full space-y-4">
              {COLORS.map(({ color, name }, idx) => (
                <div
                  key={color}
                  className={`flex justify-between items-center ${idx !== COLORS.length - 1 ? 'border-b border-gray-100 pb-3' : ''
                    }`}
                >
                  <span className="text-xs font-medium text-gray-500 w-12">
                    {name}
                  </span>

                  <div className="flex gap-6">
                    {Object.entries(SIZES).map(([sizeLabel, sizePx]) => (
                      <div key={sizeLabel} className="flex flex-col items-center">
                        <Component
                          width={sizePx}
                          height={sizePx}
                          style={{ color }}
                        />
                        <span className="text-[10px] text-gray-400 mt-1">
                          {sizeLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}