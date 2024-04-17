import NeonEventInstance from './neonEventInstance.js';

export default class NeonEventType {
	constructor(event) {
		this.category = event.category;
		this.name = event.name;
		this.typeId = event.typeId;
		this.classInstances = [];
		this.isPrivate = event.isPrivate;
		this.sorted = false;

		if (this.name.match(/Private|Checkout/)) {
			this.isPrivate = true
		}

		if (event.classInstances) this.addInstances(...event.classInstances)
	}

	addInstances(...instances) {
		for (const instance of instances) {
			this.classInstances.push(new NeonEventInstance(instance, this))
		}
		this.sorted = false
	}

	sortInstances() {
		if (this.sorted) return

		this.classInstances.sort((a, b) => a.startDateTime - b.startDateTime)
		this.sorted = true
	}

	soonestDateTime() {
		this.sortInstances();
		const latest = this.classInstances[0]?.startDateTime
		if (latest && latest > Date.now()) {
			return latest
		}

		return Infinity
	}

	instanceList(soonestOnly) {
		this.sortInstances()
		return soonestOnly ? this.classInstances[0] : this.classInstances
	}

	toJson() {
		return {
			...this,
			classInstances: this.classInstances.map(i => i.toJson())
		}
	}
}

NeonEventType.fromPrisma = function(prismaNeonEventType) {
	let isPrivate, category;
	prismaNeonEventType.category.forEach(cat => {
		if (cat.archCategories.name === 'Private') {
			isPrivate = true
		} else {
			category = cat.archCategories.name
		}
	})
	return new NeonEventType({...prismaNeonEventType, typeId: prismaNeonEventType.id, isPrivate, category})
}
