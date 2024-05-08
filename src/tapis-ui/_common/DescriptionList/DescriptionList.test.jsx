import React from 'react';
import { render } from '@testing-library/react';
import DescriptionList, * as DL from 'tapis-ui/_common/DescriptionList/DescriptionList';

const DATA = {
  Username: 'bobward500',
  Prefix: 'Mr.',
  Name: 'Bob Ward',
  Suffix: 'The 5th',
};

describe('Description List', () => {
  it('has accurate tags', async () => {
    const { getByTestId, findAllByTestId } = render(
      <DescriptionList data={DATA} />
    );
    const list = getByTestId('list');
    const keys = await findAllByTestId('key');
    const values = await findAllByTestId('value');
    expect(list).toBeDefined();
    expect(list.tagName).toEqual('DL');
    keys.forEach((key) => {
      expect(key.tagName).toEqual('DT');
    });
    values.forEach((value) => {
      expect(value.tagName).toEqual('DD');
    });
  });
  it.each(DL.DIRECTIONS)(
    'has accurate className when direction is "%s"',
    (direction) => {
      const { getByTestId } = render(
        <DescriptionList data={DATA} direction={direction} />
      );
      const list = getByTestId('list');
      const className =
        DL.DIRECTION_CLASS_MAP[direction || DL.DEFAULT_DIRECTION];
      expect(list).toBeDefined();
      expect(list.className).toMatch(className);
    }
  );
  it.each(DL.DENSITIES)(
    'has accurate className when density is "%s"',
    (density) => {
      const { getByTestId } = render(
        <DescriptionList data={DATA} density={density} />
      );
      const list = getByTestId('list');
      const className = DL.DENSITY_CLASS_MAP[density || DL.DEFAULT_DENSITY];
      expect(list).toBeDefined();
      expect(list.className).toMatch(className);
    }
  );

  it('renders multiple <dd> terms when value is an Array', async () => {
    const dataWithArray = {
      Hobbits: [
        'Frodo Baggins',
        'Samwise Gamgee',
        'Meriadoc Brandybuck',
        'Peregrin Took',
      ],
    };
    const { findAllByTestId } = render(
      <DescriptionList data={dataWithArray} />
    );
    const keys = await findAllByTestId('key');
    const values = await findAllByTestId('value');
    expect(keys.length).toEqual(1);
    expect(values.length).toEqual(5);
  });
});
