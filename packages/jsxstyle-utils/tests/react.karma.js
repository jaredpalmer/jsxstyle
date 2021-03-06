import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom';
import { Block, InlineBlock, Row, Col, cache } from 'jsxstyle';

describe('jsxstyle', () => {
  const node = document.createElement('div');
  // element has to be in the page for getComputedStyle to work
  document.body.appendChild(node);

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(node);
    cache.reset();
  });

  it('does the thing', () => {
    const id = 'jsxstyle-test';

    expect(() => {
      ReactDOM.render(
        <Col>
          <Row>
            <Block
              component="a"
              props={{ id, href: '#wow' }}
              color="blue"
              placeholderColor="red"
              hoverColor="orange"
              activeColor="purple"
              activePlaceholderColor="cyan"
              flex={1}
              width={2 / 3}
              maxWidth={600}
            >
              <InlineBlock>Neat!</InlineBlock>
            </Block>
          </Row>
        </Col>,
        node
      );
    }).not.toThrow();

    const item = document.getElementById(id);
    expect(item.getAttribute('class')).toEqual('_1fc5o');

    const style = window.getComputedStyle(item);
    const styleObj = {};
    for (let idx = -1, len = style.length; ++idx < len; ) {
      const k = style[idx];
      styleObj[k] = style.getPropertyValue(k);
    }
    expect(styleObj).toEqual(
      jasmine.objectContaining({
        color: 'rgb(0, 0, 255)',
        'max-width': '600px',
      })
    );
  });
});
