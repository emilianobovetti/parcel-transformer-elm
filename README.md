This package was published to address a [parcel issue](https://github.com/parcel-bundler/parcel/issues/6124) that made the bundler to stop watching elm files after a compilation error.

That issue was addressed with [this pr](https://github.com/parcel-bundler/parcel/pull/7547), so now nobody should rely on this ugly hack.

Anyway, to play around with this, you'll need to `yarn add --dev parcel-transformer-elm` and put something like this in your `.parcelrc`:

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.elm": ["parcel-transformer-elm"]
  }
}
```
