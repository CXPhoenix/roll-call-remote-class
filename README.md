# 點名系統
> Author: CXPhoenix

## Description
#### The project develop for remote education using firebase service.

* version: 2.0.0
* Licence: GNU GENERAL PUBLIC LICENSE v3.0

## Project Setting
    npm install

## Firebase Config Setting

* Build a file "firebaseConfig.js" in srcJs/functions/
* Write the firebaseConfig

```
export const firebaseConfig = {
    apiKey: [Your API Key],
    authDomain: [Your Auth Domain],
    projectId: [Your firebase project id],
    storageBucket: [Your storage bucket code],
    messagingSenderId: [Your messaging sender id],
    appId: [Your app id],
    measurementId: [Your measurement id]
};
```

## Compiles for development
webpack/development

    npm run build-dev

webpack/dev-watch

    npm run build-dev:watch

## Compiles for Production
webpack/production

    npm run build
