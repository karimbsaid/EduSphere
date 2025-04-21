import React from "react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import DropDown from "../../ui/DropDownn";
import PopulaireCours from "./PopulaireCours";
import PopulaireInstructor from "./PopulaireInstructor";

export default function Rapport() {
  return (
    <Card>
      <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1>Rapports et analyses</h1>
            <h2>Analysez les performances de votre plateforme</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <DropDown value="">
              <DropDown.Button label="Filtrer par" />
              <DropDown.Content>
                <DropDown.Item value="semaine">cette semaine</DropDown.Item>
                <DropDown.Item value="mois">ce mois</DropDown.Item>
                <DropDown.Item value="annee">cette année</DropDown.Item>
              </DropDown.Content>
            </DropDown>
            <Button label="Générer un rapport" />
          </div>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PopulaireCours />

          <PopulaireInstructor />

          {/* <Card>
            <CardHeader>
              <CardTitle>Taux de complétion par catégorie</CardTitle>
              <CardDescription>
                Pourcentage moyen de cours terminés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completionRates.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span>{category.name}</span>
                      </div>
                      <span className="font-medium">{category.rate}%</span>
                    </div>
                    <Progress value={category.rate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activité des utilisateurs</CardTitle>
              <CardDescription>
                Engagement quotidien sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full bg-slate-50 rounded-md flex items-center justify-center">
                <p className="text-slate-500">
                  Graphique d'activité des utilisateurs
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="border rounded-md p-3">
                  <div className="text-sm text-slate-500">
                    Sessions moyennes
                  </div>
                  <div className="text-xl font-bold">24 min</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-sm text-slate-500">
                    Pages par session
                  </div>
                  <div className="text-xl font-bold">5.2</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-sm text-slate-500">Taux de rebond</div>
                  <div className="text-xl font-bold">32%</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-sm text-slate-500">
                    Utilisateurs actifs
                  </div>
                  <div className="text-xl font-bold">4,256</div>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </Card>
  );
}
