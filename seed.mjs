import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const mockRequests = [
  { programName: 'Тур по Алтаю', programDate: '2024-07-15', clientType: 'Взрослые', fullName: 'Иванов Петр', phone: '+79990001122', email: 'ivanov@mail.ru', peopleCount: 2, status: 'Новая' },
  { programName: 'Экскурсия в Эрмитаж', programDate: '2024-08-01', clientType: 'Школьники', fullName: 'Марья Ивановна', phone: '+79110002233', email: 'maria@school.ru', peopleCount: 25, status: 'Оплачено' },
  { programName: 'Поход в горы', programDate: '2024-09-10', clientType: 'Взрослые', fullName: 'Смирнов Алексей', phone: '+79112223344', email: null, peopleCount: 4, status: 'Ждём оплату' },
  { programName: 'Кемпинг на озере', programDate: '2024-07-20', clientType: 'Взрослые', fullName: 'Елена Кузнецова', phone: '+79993334455', email: 'elena@gmail.com', peopleCount: 3, status: 'Заказано частично' },
  { programName: 'Музей космонавтики', programDate: '2024-06-05', clientType: 'Школьники', fullName: 'Анна Сергеевна', phone: '+79998887766', email: 'anna@mail.ru', peopleCount: 15, status: 'Проведена' }
];

async function main() {
  for (const req of mockRequests) {
    await prisma.request.create({ data: req });
  }
  console.log('Seeded 5 requests');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
