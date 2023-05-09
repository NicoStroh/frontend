import { pagesQuery } from "@/__generated__/pagesQuery.graphql";
import { Heading } from "@/components/Heading";
import { Subheading } from "@/components/Subheading";
import Searchbar from "@/components/Searchbar";
import Accordion from "@/components/Accordion";
import Link from "next/link";
import { graphql, useLazyLoadQuery } from "react-relay";
import { VictoryPie, VictoryLabel } from "victory";

export default function Home() {
  const { courses } = useLazyLoadQuery<pagesQuery>(
    graphql`
      query pagesQuery {
        courses {
          id
          name
          description
        }
      }
    `,
    {}
  );
  const percents = [55, 88, 15, 27];

  return (
    <main className="">
      <Heading className="mb-5">Welcome back to GITS, Valentin!</Heading>
      <Searchbar></Searchbar>
      <Subheading>My active Courses</Subheading>
      <div className="flex flex-col gap-3">
        {courses.map((course, index) => (
          <Link
            className="mx-10 font-bold text-white bg-sky-900 hover:bg-sky-800 p-5 pl-3 rounded-lg grid grid-cols-3 items-center"
            href={`/course/${course.id}`}
            key={course.id}
          >
            <div className="text-xl font-bold">{course.name}</div>
            <div className="text-sm italic">{course.description}</div>
            <div className="w-64 h-20 mr-5 grid grid-cols-4 right-0">
              <div>
                <VictoryPie
                  colorScale={["white", "transparent"]}
                  innerRadius={120}
                  cornerRadius={100}
                  labels={["W"]}
                  labelRadius={1}
                  labelPosition={"startAngle"}
                  data={[{ y: percents[index] }, { y: 100 - percents[index] }]}
                  style={{ labels: { fontSize: 100, fill: "white" } }}
                  labelComponent={<VictoryLabel dy={50} />}
                />
              </div>

              <VictoryPie
                colorScale={["green", "transparent"]}
                innerRadius={120}
                cornerRadius={100}
                labels={["V"]}
                labelRadius={1}
                labelPosition={"startAngle"}
                data={[{ y: percents[index] }, { y: 100 - percents[index] }]}
                style={{ labels: { fontSize: 100, fill: "white" } }}
                labelComponent={<VictoryLabel dy={50} />}
              />
              <VictoryPie
                colorScale={["gold", "transparent"]}
                innerRadius={120}
                cornerRadius={100}
                labels={["A"]}
                labelRadius={1}
                labelPosition={"startAngle"}
                data={[{ y: percents[index] }, { y: 100 - percents[index] }]}
                style={{ labels: { fontSize: 100, fill: "white" } }}
                labelComponent={<VictoryLabel dy={50} />}
              />
              <VictoryPie
                colorScale={["red", "transparent"]}
                innerRadius={120}
                cornerRadius={100}
                labels={["A"]}
                labelRadius={1}
                labelPosition={"startAngle"}
                data={[{ y: percents[index] }, { y: 100 - percents[index] }]}
                style={{ labels: { fontSize: 100, fill: "white" } }}
                labelComponent={<VictoryLabel dy={50} />}
              />
            </div>
          </Link>
        ))}
      </div>{" "}
      <Subheading>All my Courses</Subheading>
      <div className="grid">
        <Accordion>
          {courses.map((course, index) => (
            <Link
              className="mx-10 font-bold text-white bg-sky-900 hover:bg-sky-800 p-5 pl-3 rounded-lg grid grid-cols-3 items-center"
              href={`/course/${course.id}`}
              key={course.id}
            >
              <div className="text-xl font-bold">{course.name}</div>
              <div className="text-sm italic">{course.description}</div>
              <div className="w-64 h-20 mr-5 grid grid-cols-4 right-0">
                <div>
                  <VictoryPie
                    colorScale={["white", "transparent"]}
                    innerRadius={120}
                    cornerRadius={100}
                    labels={["W"]}
                    labelRadius={1}
                    labelPosition={"startAngle"}
                    data={[
                      { y: percents[index] },
                      { y: 100 - percents[index] },
                    ]}
                    style={{ labels: { fontSize: 100, fill: "white" } }}
                    labelComponent={<VictoryLabel dy={50} />}
                  />
                </div>

                <VictoryPie
                  colorScale={["green", "transparent"]}
                  innerRadius={120}
                  cornerRadius={100}
                  labels={["V"]}
                  labelRadius={1}
                  labelPosition={"startAngle"}
                  data={[{ y: percents[index] }, { y: 100 - percents[index] }]}
                  style={{ labels: { fontSize: 100, fill: "white" } }}
                  labelComponent={<VictoryLabel dy={50} />}
                />
                <VictoryPie
                  colorScale={["gold", "transparent"]}
                  innerRadius={120}
                  cornerRadius={100}
                  labels={["A"]}
                  labelRadius={1}
                  labelPosition={"startAngle"}
                  data={[{ y: percents[index] }, { y: 100 - percents[index] }]}
                  style={{ labels: { fontSize: 100, fill: "white" } }}
                  labelComponent={<VictoryLabel dy={50} />}
                />
                <VictoryPie
                  colorScale={["red", "transparent"]}
                  innerRadius={120}
                  cornerRadius={100}
                  labels={["A"]}
                  labelRadius={1}
                  labelPosition={"startAngle"}
                  data={[{ y: percents[index] }, { y: 100 - percents[index] }]}
                  style={{ labels: { fontSize: 100, fill: "white" } }}
                  labelComponent={<VictoryLabel dy={50} />}
                />
              </div>
            </Link>
          ))}
        </Accordion>
      </div>
    </main>
  );
}
