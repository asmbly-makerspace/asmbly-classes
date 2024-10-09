import { DateTime } from 'luxon';

export default class NeonEventInstance {
	constructor (instance, eventType) {
		this.eventId = instance.eventId
		this.attendees = instance.attendeeCount || instance.attendees || 0
		this.teacher = instance.teacher.name || instance.teacher
		this.startDateTime = DateTime.fromJSDate(instance.startDateTime)
		this.endDateTime = DateTime.fromJSDate(instance.endDateTime)
		this.price = instance.price
		this.summary = instance.summary
		this.capacity = instance.capacity
		this.category =  eventType.category
		this.name = eventType.name
		this.typeId = eventType.typeId
		this.isPast = instance.startDateTime < DateTime.now()
		this.isFull = this.attendees >= this.capacity
	}

	get classUrl() {
		return `?eventId=${this.eventId}`
	}

	toJson() {
		return {
			...this,
			startDateTime: this.startDateTime.toJSDate(),
			endDateTime: this.endDateTime.toJSDate()
		}
	}

	isAvailable() {
		return !this.isPast
	}

	compare(o, type, sortAscending) {
		let sort = 0;
		switch(type){
		case 'Date':
			sort = this.isPast * 1 + o.isPast * -1
			if (!sort) {
				sort = this.startDateTime - o.startDateTime
				if (Math.abs(sort) < 1000) sort = 0;
			}
			break;
		case 'Price':
			sort = this.price - o.price;
			break
		}

		if (!sort) {
			sort = this.name.toLowerCase().localeCompare(o.name.toLowerCase())
		}

		if (!sortAscending) {
			sort *= -1
		}

		return sort
	}

	getClassImage(classImages) {
		let result = classImages['/src/lib/images/' + this.name.replace(/\s+/g, '_') + '.jpg'];

		if (typeof result === 'undefined' || result === null) {
			switch (this.category) {
				case 'Laser Cutting':
					result = classImages['/src/lib/images/lasersDefault.jpg'];
					break;
				default:
					const imgPath = this.category.replace(' ', '').toLowerCase()
					result = classImages[`/src/lib/images/${imgPath}Default.jpg`]
			}
		}
		if (typeof result === 'undefined' || result === null) {
			result = classImages['/src/lib/images/classDefault.jpg'];
		}

		return result.default;
	}
}
