import * as Yup from 'yup';

export default function validJson() {
  return Yup.string().test('is-valid-json', function (value) {
    const { path, createError } = this;
    try {
      if (value !== undefined) {
        JSON.parse(value);
      }
    } catch (e: any) {
      return createError({ path, message: e.message });
    }

    return true;
  });
}
