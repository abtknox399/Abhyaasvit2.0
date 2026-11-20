import "./globals.css";
import "katex/dist/katex.min.css";
import type {Metadata} from "next";
export const metadata:Metadata={title:{default:"Abhyaas VIT | Academic Command Center",template:"%s | Abhyaas VIT"},
 description:"Independent VIT Pune learning platform: practice, test, review and prepare."};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en" suppressHydrationWarning><body className="min-h-screen font-sans antialiased">{children}</body></html>;
}
