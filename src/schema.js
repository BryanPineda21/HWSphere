import {string, z} from "zod";
 

export const schema = z.object({
    firstname: z.string().min(2).refine(value => !/\s/.test(value), {
        message: "First Name cannot contain whitespace",
    }).transform(value => value.toLowerCase())
    .transform(value => value[0].toUpperCase() + value.slice(1)),
    lastname: z.string().min(2).refine(value => !/\s/.test(value), {
        message: "Last Name cannot contain whitespace",
    }).transform(value => value.toLowerCase())
    .transform(value => value[0].toUpperCase() + value.slice(1)),
    username: z.string().min(6).refine(value => !/\s/.test(value), {
        message: "Username cannot contain whitespace",
    }),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
})
.refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});