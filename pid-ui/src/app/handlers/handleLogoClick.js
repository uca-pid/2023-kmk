import Link from "next/link";

const handleLogoClick = () => {
    router.refresh("/");
    <Link href="/">
        <a>
            <img
                src="/logo.png"
                alt="logo"
                className="w-20 h-20 cursor-pointer"
            />
        </a>
    </Link>;
};

export default handleLogoClick;
