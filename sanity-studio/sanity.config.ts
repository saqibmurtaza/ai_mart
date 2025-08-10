// // import {defineConfig} from 'sanity'
// // import {structureTool} from 'sanity/structure'
// // import {visionTool} from '@sanity/vision'
// // import {schemaTypes} from './schemaTypes'

// // export default defineConfig({
// //   apiVersion: '2025-07-06',
// //   name: 'default',
// //   title: 'AIMart',

// //   projectId: 'fb3pwyau',
// //   dataset: 'production',

// //   plugins: [structureTool(), visionTool()],

// //   schema: {
// //     types: schemaTypes,
// //   },
// // })


// import { defineConfig } from 'sanity'
// import { deskTool } from 'sanity/desk'
// import { visionTool } from '@sanity/vision'
// import { schemaTypes } from './schemaTypes'

// export default defineConfig({
//   apiVersion: '2025-07-06',
//   name: 'default',
//   title: 'AIMart',

//   projectId: 'fb3pwyau',
//   dataset: 'production',

//   plugins: [deskTool(), visionTool()], // ✅ use deskTool instead of structureTool

//   schema: {
//     types: schemaTypes,
//   },
// })

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  apiVersion: '2025-07-06',
  name: 'default',
  title: 'AIMart',

  projectId: 'fb3pwyau',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
