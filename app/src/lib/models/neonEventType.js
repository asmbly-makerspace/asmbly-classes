import NeonEventInstance from '$lib/models/neonEventInstance.js';

export default class NeonEventType {
	constructor(event) {
		this.category = event.category;
		this.name = event.name;
		this.typeId = event.typeId;
		this.classInstances = [];
		this.isPrivate = event.isPrivate;
		this.sorted = false;
		this.anyCurrent = false;

		if (this.name.match(/Private|Checkout/)) {
			this.isPrivate = true
		}

		if (event.classInstances) this.addInstances(...event.classInstances)
	}

	get summary() {
		return classInstances[0].summary
	}

	addInstances(...instances) {
		for (const instance of instances) {
			const instanceModel = new NeonEventInstance(instance, this)
			this.classInstances.push(instanceModel);
			if (!instanceModel.isPast) this.anyCurrent = true;
		}
		this.sorted = false
	}

	sortInstances() {
		if (this.sorted) return

		this.classInstances.sort((a, b) => a.startDateTime - b.startDateTime)
		this.sorted = true
	}

	soonest(showAll) {
		this.sortInstances();
		if (showAll) return this.classInstances[0]

		for (let i = 0; i < this.classInstances.length; i++) {
			if (this.classInstances[i].isAvailable()) {
				return this.classInstances[i]
			}
		}

		return this.classInstances[0]
	}

	instanceList(soonestOnly, showAll) {
		this.sortInstances()
		return soonestOnly ? this.soonest(showAll) : this.classInstances
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
		if (!cat.archCategories) return
		if (cat.archCategories.name === 'Private') {
			isPrivate = true
		} else {
			category = cat.archCategories.name
		}
	})
	return new NeonEventType({...prismaNeonEventType, typeId: prismaNeonEventType.id, isPrivate, category})
}
