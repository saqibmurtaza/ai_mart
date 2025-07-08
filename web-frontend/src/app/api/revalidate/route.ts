import { revalidatePath, revalidateTag } from 'next/cache';
    import { NextRequest, NextResponse } from 'next/server';

    // This is a simple secret key to secure your webhook.
    // It should match the secret you set in Sanity's webhook configuration.
    const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

    export async function POST(request: NextRequest) {
      try {
        const body = await request.json();
        const { _type, slug } = body; // Assuming Sanity webhook sends _type and slug

        // Verify the secret for security
        const secret = request.headers.get('sanity-api-secret');
        if (secret !== SANITY_WEBHOOK_SECRET) {
          return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
        }

        console.log(`Revalidation request received for type: ${_type}, slug: ${slug}`);

        // Revalidate paths based on content type
        switch (_type) {
          case 'product':
            revalidatePath('/products'); // Revalidate the main products page
            if (slug && slug.current) {
              revalidatePath(`/products/${slug.current}`); // Revalidate individual product page
            }
            break;
          case 'category':
            revalidatePath('/'); // Revalidate homepage for category changes
            revalidatePath('/products'); // Revalidate products page if categories affect it
            break;
          case 'homepageSection': // For your benefits section, etc.
            revalidatePath('/'); // Revalidate homepage
            break;
          case 'contentBlock': // For dynamic content blocks
            revalidatePath('/'); // Revalidate homepage
            break;
          // Add more cases for other document types as needed
          // For example, if you have a 'promotionalBanner' type:
          case 'promotionalBanner':
            revalidatePath('/'); // Revalidate homepage
            break;
          default:
            // If the document type is not explicitly handled, revalidate the homepage
            revalidatePath('/');
            break;
        }

        return NextResponse.json({ revalidated: true, now: Date.now() });

      } catch (error) {
        console.error('Error handling revalidation request:', error);
        return NextResponse.json({ message: 'Error revalidating', error: (error as Error).message }, { status: 500 });
      }
    }