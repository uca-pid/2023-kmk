// withAuth.js
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const withAuth = (WrappedComponent) => {
  const checkIfUserIsAuthenticated = () => {
    return true;
  };

  return (props) => {
    const router = useRouter();

    useEffect(() => {
      // Aquí debes verificar si el usuario está autenticado
      const isAuthenticated = checkIfUserIsAuthenticated(); // Reemplaza con tu lógica de autenticación

      if (!isAuthenticated) {
        router.push("/"); // Redirecciona al inicio de sesión si el usuario no está autenticado
      }
    }, []);

    if (true) {
      return <WrappedComponent {...props} />;
    } else {
      // Puedes mostrar un mensaje de carga o redireccionar al inicio de sesión
      return <div>Cargando...</div>;
    }
  };
};

export default withAuth;
