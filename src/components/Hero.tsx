import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <>
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1541888086425-d81bb19240f5?q=80&w=2000&auto=format&fit=crop"
            alt="Construcción"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl max-w-2xl leading-tight">
            Acero y Materiales para tus Obras al Instante.
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl font-light">
            Surtimos tu obra con rapidez y calidad. Elabora tu lista de requirimentos online y nuestro equipo comercial optimizará tu cotización con despacho a nivel nacional.
          </p>
          <div className="mt-10 flex gap-4">
            <a
              href="#catalogo"
              className="inline-flex items-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-500 hover:scale-105 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Iniciar Cotización
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </a>
            <a
              href="#contacto"
              className="inline-flex items-center px-8 py-3.5 border border-gray-300 text-base font-semibold rounded-md shadow-sm text-white bg-transparent hover:bg-white/10 transition-all"
            >
              Hablar con un Asesor
            </a>
          </div>
        </div>
      </div>

      {/* Trust Indicators Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-gray-100 text-center">
            <div className="px-4">
              <p className="text-3xl font-extrabold text-orange-600">+15</p>
              <p className="mt-1 text-sm font-medium text-gray-600 uppercase tracking-wide">Años de Exp.</p>
            </div>
            <div className="px-4">
              <p className="text-3xl font-extrabold text-orange-600">Stock</p>
              <p className="mt-1 text-sm font-medium text-gray-600 uppercase tracking-wide">Inmediato</p>
            </div>
            <div className="px-4">
              <p className="text-3xl font-extrabold text-orange-600">Nacional</p>
              <p className="mt-1 text-sm font-medium text-gray-600 uppercase tracking-wide">Envíos Seguros</p>
            </div>
            <div className="px-4">
              <p className="text-3xl font-extrabold text-orange-600">Calidad</p>
              <p className="mt-1 text-sm font-medium text-gray-600 uppercase tracking-wide">Garantizada</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
