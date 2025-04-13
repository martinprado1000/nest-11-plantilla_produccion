export const envLoader = () => ({
    jwt_secret: process.env.JWT_SECRET,
    environment: process.env.NODE_ENV,
    port: Number(process.env.PORT),
    hostApi: process.env.HOST_API,
    database: {
        uri: process.env.DATABASE_URI,
        port: process.env.DATABASE_PORT,
        name: process.env.DATABASE_NAME,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
    },
    pagination: {
        defaultLimit: Number(process.env.PAGINATIONS_DEFAULT_LIMIT)
    },
    mailer: {
        host: process.env.MAILER_HOST,
        port: process.env.MAILER_PORT,
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASS,
    },
    passwordSeedUsers: process.env.PASSWORD_SEED_USERS,
    audit: process.env.AUDIT,
})