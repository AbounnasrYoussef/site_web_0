export const JobsSkeleton = () => (
	<div className="flex flex-col gap-6 animate-pulse">
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{[...Array(2)].map((_, i) => (
					<div key={i} className="relative overflow-hidden border-2 border-(--color-text) bg-(--color-surface) p-5">
						<div className="h-4 w-28 bg-gray-200 rounded mb-3"></div>
						<div className="h-8 w-16 bg-gray-200 rounded"></div>
					</div>
				))}
			</div>
		</div>
		<div className="border-2 border-(--color-text) overflow-hidden bg-(--color-surface)">
			<div className="overflow-x-auto overflow-y-auto custom-scrollbar max-h-[60vh]">
				<table className="w-full text-left border-collapse min-w-200 rtl:text-right">
					<thead>
						<tr className="bg-(--color-grey)">
							<th className="p-4"><div className="h-4 w-32 bg-gray-300 rounded"></div></th>
							<th className="p-4"><div className="h-4 w-24 bg-gray-300 rounded"></div></th>
							<th className="p-4 text-center"><div className="h-4 w-20 bg-gray-300 rounded mx-auto"></div></th>
						</tr>
					</thead>
					<tbody>
						{[...Array(6)].map((_, i) => (
							<tr key={i} className="border-b-2 border-(--color-grey) last:border-0">
								<td className="p-4">
									<div className="h-4 w-40 bg-gray-200 rounded"></div>
								</td>
								<td className="p-4">
									<div className="h-4 w-20 bg-gray-200 rounded"></div>
								</td>
								<td className="p-4">
									<div className="flex items-center justify-center gap-2">
										<div className="h-8 w-20 bg-gray-200 rounded border-2 border-transparent"></div>
										<div className="h-8 w-20 bg-gray-200 rounded border-2 border-transparent"></div>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	</div>
)