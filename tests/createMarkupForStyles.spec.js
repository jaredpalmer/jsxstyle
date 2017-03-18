'use strict';

const createMarkupForStyles = require('../src/createMarkupForStyles');

describe('createMarkupForStyles', () => {
  it('returns null when given an empty style object', () => {
    const markup = createMarkupForStyles({});
    expect(markup).toEqual(null);
  });

  it('converts a style object to a style string that only contains valid styles', () => {
    global.console = {warn: jest.fn()};
    function Useless(stuff) {
      this.stuff = stuff;
    }

    Object.assign(Useless.prototype, {
      toString() {
        return this.stuff;
      },
    });

    function prototypeTest(stuff) {
      return new Useless(stuff);
    }

    const markup = createMarkupForStyles({
      validProp1: 'string',
      validProp2: 1234,
      validProp3: 0,
      validProp4: prototypeTest('wow'),
      invalidProp1: null,
      invalidProp2: undefined,
      // invalidProp3: false, // hmmmmmmmmmmmmm
    });

    expect(markup).toEqual(
      `
  valid-prop1:string;
  valid-prop2:1234px;
  valid-prop3:0;
  valid-prop4:wow;
`
    );
    expect(console.warn).toHaveBeenCalledTimes(0);
  });

  it('warns about invalid style props if NODE_ENV is not set to "production"', () => {
    global.console = {warn: jest.fn()};

    // TODO: strip these out?
    const invalidStyles = {
      invalidProp1: {},
      invalidProp2: [],
      invalidProp3: ['one', 'two'],
    };

    process.env.NODE_ENV = 'production';
    const markup = createMarkupForStyles(invalidStyles);
    expect(console.warn).toHaveBeenCalledTimes(0);

    process.env.NODE_ENV = 'development';
    createMarkupForStyles(invalidStyles);
    expect(console.warn).toHaveBeenCalledTimes(2);

    // gross
    expect(markup).toEqual(
      `
  invalid-prop1:[object Object];
  invalid-prop2:;
  invalid-prop3:one,two;
`
    );
  });
});
