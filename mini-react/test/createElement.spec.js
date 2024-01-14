import React from "../croe/React"
import { it, expect, describe } form "vitest"

describe("createElement", () => {
    it("should return vdom for element", () => {
        const el = React.createElement('div', null, "jjj")
        expect(el).toEqual({
            type: 'div',
            props: {
                children: [
                    type: 'TEXT_ELEMENT',
                    props: {
                        nodeValue: "jjj",
                        children: []
                    }
                ]
            }
        })
    })
})