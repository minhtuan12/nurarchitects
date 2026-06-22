export function getNextActivityOrder(currentHighestOrder: number | null | undefined) {
	return (currentHighestOrder ?? 0) + 1;
}

export function clampActivityOrder(order: number, total: number) {
	return Math.min(Math.max(order, 1), Math.max(total, 1));
}

export function buildActivityReorderOperations(
	activityId: string,
	currentOrder: number,
	nextOrder: number,
) {
	if (currentOrder === nextOrder) {
		return [];
	}

	const shiftFilter =
		nextOrder < currentOrder
			? { order: { $gte: nextOrder, $lt: currentOrder } }
			: { order: { $gt: currentOrder, $lte: nextOrder } };
	const shiftAmount = nextOrder < currentOrder ? 1 : -1;

	return [
		{
			updateMany: {
				filter: {
					_id: { $ne: activityId },
					...shiftFilter,
				},
				update: { $inc: { order: shiftAmount } },
			},
		},
		{
			updateOne: {
				filter: { _id: activityId },
				update: { $set: { order: nextOrder } },
			},
		},
	];
}
