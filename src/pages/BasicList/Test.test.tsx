// /**
//  * @jest-environment jsdom
//  */


// //上面不加不起作用 
// // cnpm i @testing-library/react @testing-library/jest-dom -D
// //npm run test Test.test.tsx

// import React from 'react'
// import { render ,screen,fireEvent} from '@testing-library/react'
// import '@testing-library/jest-dom/extend-expect'
// import Test from './Test'

// test('Test component',()=>{
//     render(<Test/>);
//     expect(screen.getByDisplayValue('tiger')).toBeInTheDocument()
//     fireEvent.click(screen.getByText('Change'))
//     screen.debug()
//     expect(screen.getByDisplayValue('cat')).toBeInTheDocument()
// })