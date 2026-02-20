import { z } from 'zod';

export const skinSchema = z
  .object({
    tenant: z.string().min(1),
    mode: z.enum(['fullpage', 'widget']),
    brand: z.object({
      name: z.string().min(1),
      favicon: z.string().min(1),
      logo: z.string().min(1),
      primary: z.string().min(1)
    }),
    directLine: z.object({
      tokenUrl: z.string().url(),
      domain: z.string().url().optional()
    }),
    webchat: z.object({
      styleOptions: z.string().min(1),
      adaptiveCardsHostConfig: z.string().min(1),
      locale: z.string().min(2).default('en-US')
    }),
    statusBar: z
      .object({
        show: z.boolean().default(true),
        brand: z
          .object({
            ok: z.string().min(1).optional(),
            warn: z.string().min(1).optional(),
            err: z.string().min(1).optional()
          })
          .partial()
          .default({})
      })
      .optional()
      .default({ show: true, brand: {} }),
    fullpage: z.object({
      index: z.string().min(1),
      css: z.string().min(1)
    }),
    hooks: z
      .object({
        script: z.string().min(1)
      })
      .optional()
  })
  .superRefine((value, ctx) => {
    if (value.mode === 'fullpage' && !value.fullpage) {
      ctx.addIssue({
        code: 'custom',
        message: 'Full page skins must define a fullpage block'
      });
    }
  });
