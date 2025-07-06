// This file aggregates all your individual schemas into a single array.

import product from './product'
import promo from './promo'
import homepageSection from './homepageSection';
import contentBlock from './contentBlock';
import category from './category';

export const schemaTypes = [product, promo, homepageSection, contentBlock, category]

import { Rule, defineType, defineField } from 'sanity';
