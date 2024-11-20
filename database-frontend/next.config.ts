import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        const port = process.env.PORT || "55001"; // Fallback if PORT is not defined
        console.log(`Using port: ${port}`) // For some reason this is always returning the port
        // that the front end is hosted on, but it should return 55001 or the port the tunnel is using
        // because of this error I have hard coded the port in below to make it work.

        // ALSO something that needs fixing. When you close the 3000 port, the 55001 or whatever tunnel port
        // still runs on your computer. Not sure how to make sure this is closed too when you close the frontend 3000 port
        // you can go to your terminal and manually close them tho
        // use 'lsof -i' to see what ports are running
        // find the pid of the localhost port you can to close
        // use 'kill -9 <pid>' to turn it off
        // I also feel like it's not closing some other ports so if one of you guys want to look into that too would be dope.
        return [
            {
                source: '/api/:path*',
                destination: `http://localhost:55001/:path*`, // Proxy
            },
        ];
    },
};

export default nextConfig;
