import NeonEventInstance from '$lib/models/neonEventInstance.js';

export default class NeonEventType {
	constructor(event) {
		this.category = event.category || null;
		this.name = event.name;
		this.typeId = event.id || event.typeId;
		this.classInstances = [];
		this.isPrivate = event.isPrivate;
		this.sorted = false;
		this.anyCurrent = false;

		if (this.name.match(/Private|Checkout/)) {
			this.isPrivate = true
		}

		if (event.classInstances) {
			this.addInstances(...event.classInstances)
		} else if (event.instances) {
			this.addInstances(...event.instances)
		}		
	}

	get summary() {
		if (this.classInstances.length > 0 && typeof this.classInstances[0].summary !== 'undefined') {
			return this.classInstances[0].summary
		}
		return 'No summary available'
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
	let isPrivate, category, instance;

	if (prismaNeonEventType.instances.length > 0) {
		instance = prismaNeonEventType.instances.find(i => i.category.archCategories.name !== 'Private')
		instance ? category = instance.category.archCategories.name : category = null
	} else {
		category = prismaNeonEventType.category.find(c => c.archCategories.name !== 'Private')
		category ? category = category.archCategories.name : category = null
	}
	if (category) {
		isPrivate = false
	} else {
		isPrivate = true
	}
	return new NeonEventType({...prismaNeonEventType, isPrivate: isPrivate, category: category})
}

NeonEventType.fromJson = function(jsonNeonEventType) {
	return new NeonEventType({...jsonNeonEventType, isPrivate: jsonNeonEventType.isPrivate, category: jsonNeonEventType.category})
}
