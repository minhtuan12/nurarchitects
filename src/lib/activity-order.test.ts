import { describe, expect, it } from "vitest";
import {
	buildActivityReorderOperations,
	getNextActivityOrder,
} from "./activity-order";

describe("activity order helpers", () => {
	it("assigns the first activity order as 1", () => {
		expect(getNextActivityOrder(null)).toBe(1);
	});

	it("appends a new activity after the current highest order", () => {
		expect(getNextActivityOrder(4)).toBe(5);
	});

	it("moves an activity up and shifts affected rows down", () => {
		expect(buildActivityReorderOperations("activity-3", 3, 1)).toEqual([
			{
				updateMany: {
					filter: {
						_id: { $ne: "activity-3" },
						order: { $gte: 1, $lt: 3 },
					},
					update: { $inc: { order: 1 } },
				},
			},
			{
				updateOne: {
					filter: { _id: "activity-3" },
					update: { $set: { order: 1 } },
				},
			},
		]);
	});

	it("moves an activity down and shifts affected rows up", () => {
		expect(buildActivityReorderOperations("activity-1", 1, 3)).toEqual([
			{
				updateMany: {
					filter: {
						_id: { $ne: "activity-1" },
						order: { $gt: 1, $lte: 3 },
					},
					update: { $inc: { order: -1 } },
				},
			},
			{
				updateOne: {
					filter: { _id: "activity-1" },
					update: { $set: { order: 3 } },
				},
			},
		]);
	});

	it("does not create operations when order stays the same", () => {
		expect(buildActivityReorderOperations("activity-2", 2, 2)).toEqual([]);
	});
});
