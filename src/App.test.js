import React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'

import App from './App'

describe('the App component', () => {
    it('renders a <h1> tag', () => {
        const wrapper = shallow(<App />)
        expect(wrapper.find('h1')).to.have.length(1)
    })
})
