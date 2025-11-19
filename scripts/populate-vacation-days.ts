import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'notaria';

async function populateVacationDays() {
  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI no está definido');
    console.log('Por favor, copia el MONGODB_URI de tu .env.local y ejecútalo así:');
    console.log('MONGODB_URI="tu-uri-aqui" MONGODB_DB="notaria" npx ts-node scripts/populate-vacation-days.ts');
    process.exit(1);
  }

  console.log('🔄 Conectando a MongoDB...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db(MONGODB_DB);
    const usuariosCollection = db.collection('usuarios');

    // Actualizar todos los usuarios que no tengan diasVacaciones
    const result = await usuariosCollection.updateMany(
      { diasVacaciones: { $exists: false } },
      { 
        $set: { 
          diasVacaciones: 20,
          updatedAt: new Date()
        } 
      }
    );

    console.log(`✅ ${result.modifiedCount} usuarios actualizados con 20 días de vacaciones`);

    // Mostrar todos los usuarios
    const usuarios = await usuariosCollection.find({}).toArray();
    console.log('\n📋 Usuarios en la base de datos:');
    usuarios.forEach(user => {
      console.log(`- ${user.nombre} (${user.email}): ${user.diasVacaciones || 0} días`);
    });

    console.log('\n✅ ¡Proceso completado!');
    console.log('\n📝 Nota: Para añadir 23 días cada año, deberás crear un cron job o tarea programada.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

populateVacationDays();
