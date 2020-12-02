import {it} from '@jest/globals'
import merge from 'lodash.merge'
import {payloadReducer} from './utilities'

/**
 * Created on 1399/9/12 (2020/12/2).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */

it('test 1', () => {
	const dstState = {}
	const srcState = {
		a: 'b',
		b: 10,
		v: {
			c: 'x',
			d: {
				f: {
					h: 'hello',
					m: 'world',
					x: [1, 24, 12],
				},
				l: 'fake',
			},
			'hello world': 'OK',
		},
		g: {},
		e: 2.718,
		n: {
			y: {u: 'u'},
			y2: 'yx',
		},
	}
	const payloads = [{e: 9, n: {y2: 'water'}}]
	const noTransform = payloadReducer(srcState, dstState, ...payloads)
	
	const dstState2 = merge({}, srcState, ...payloads)
	expect(dstState).toEqual(dstState2)
})